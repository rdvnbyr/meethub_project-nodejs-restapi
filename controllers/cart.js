const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/products');
const colors = require('colors');
const stripe = require('stripe')(process.env.STRIPE_KEY);


exports.payment = async (req,res,next) => {
    try {
        const {price} = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price * 100,
            currency: "eur"
          });
        res.status(200).send({
            clientSecret: paymentIntent.client_secret
          });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
};

exports.paymentEnd = async (req,res,next) => {
    try {
        const {cartId} = req.body;
        const cart = await Cart.findById(cartId);
        if (!cart) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        };
        // console.log(cart);
        // await cart.items.map( async item => {
        //     const product = Product.findById(item.product);
        //     console.log(product)
        //     const updatedStock = product.countInStock - item.quantity;
        //     await Product.findByIdAndUpdate(product._id, {countInStock: updatedStock});
        // });

        await Cart.findByIdAndUpdate(cartId, {
            isActive: false,
            isPaid: true
        });

        res.status(200).json({message: "Cart is successfully updated"});

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
};


exports.getCart = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const cart = await Cart.find({customer: userId, isActive: true, isPaid: false}).populate({path: 'items', populate: {path: 'product', model: 'Products'}});
        res.status(200).json(cart);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
};

exports.getPurchasedCart = async (req, res, next) => {
    try {
        const userId  = req.userId;
        const cart = await Cart.find({customer: userId, isActive: false, isPaid: true, isArchived: false}).populate('customer').populate({path: 'items', populate: {path: 'product', model: 'Products'}});
        res.status(200).json(cart);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
};

exports.sendCartToArchive = async (req, res, next) => {
    try {
        const {cartId} = req.body;
        await Cart.findByIdAndUpdate(cartId, {isArchived: true});
        res.status(200).json({message: "This Cart succesfully archived by customer"});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    };
};


exports.createCart = async (req, res, next) => {
    try {
        const { userId, productId } = req.body;
        let total;
        let shipping;
        let tax;
        
        const user = await User.findById(userId);
        const product = await Product.findById(productId);
        if (!user || !product) {
            const error = new Error('Product or User not found');
            error.statusCode = 404;
            throw error;
        };

        const cartUser = await Cart.find({customer: userId, isActive: true });
        const cart = cartUser[0];

        if( !cart ) {
            const newCart = new Cart({
                customer: user._id,
                items: [
                    {
                        product: product._id,
                        quantity: 1,
                        price: product.price * 1
                    }
                ],
                shippingAddress: {
                    firstname: '',
                    lastname: '',
                    address: '',
                    city: '',
                    region: '',
                    postCode: 0,
                    country: ''
                },
                paymentMethod: '',
                paymentResult: {},
                shippingPrice: (product.price * 0.01).toFixed(),
                taxPrice: (product.price * 0.03).toFixed(),
                totalPrice: ((product.price * 1) + (product.price * 0.01) + (product.price * 0.03)).toFixed(),
                shippingAt: '',
                paidAt: '',
                deliveredAt: '',
                isPaid: false,
                isDelivered: false
            })
    
            await newCart.save();
            res.status(200).json({message: "Cart successfully created"});

        } else {
            const isAlreadyAdded = cart.items.filter( (prod,index) => prod.product.toString() === product._id.toString());
            // console.log(isAlreadyAdded);
            if( !(isAlreadyAdded >= 0) ) {
                res.status(409).json({message: "Product already added", status: 409});
            } else {
                const newItems = {
                    product: product._id,
                    quantity: 1,
                    price: product.price * 1
                };
                cart.items.push(newItems);
                total = Number(cart.items.reduce((acc, product) => product.price + acc, 0)).toFixed();
                shipping = (total * 0.01).toFixed();
                tax = (total * 0.03).toFixed();
                cart.shippingPrice = shipping;
                cart.taxPrice = tax;
                cart.totalPrice = Number(Number(cart.shippingPrice + cart.taxPrice) + Number(total)).toFixed();
                // await cart.save();
                await Cart.findByIdAndUpdate(cart._id, cart);
                res.status(200).json({message: "Product successfully added"});
            }
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }

};

exports.updateShipping = async (req, res, next) => {
    try {
        const { cartId, updateShipping } = req.body;

        const cart = await Cart.findById(cartId);
        if (!cart) {
            const error = new Error('Product or User not found');
            error.statusCode = 404;
            throw error;
        };
        await Cart.findByIdAndUpdate(cartId, {
            shippingAddress: updateShipping,
        });
        res.status(200).json({message: "update shipping successfuly done"});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
};

exports.updateCart = async (req, res, next) => {
    try {
        const { productId, qty, cartId, removeProduct } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        if( qty && !(qty <= 0) ) {
            const cart = await Cart.findById(cartId);
            const cartItems = cart.items.filter( p => p.product != productId);
            const updatedProd = {
                product: productId,
                quantity: qty,
                price: product.price * qty
            };
            cartItems.push(updatedProd);
            cart.items = cartItems;
            const total = Number(cart.items.reduce((acc, item) => item.price + acc, 0)).toFixed();
            const shipping = (total * 0.01).toFixed();
            const tax = (total * 0.03).toFixed();
            cart.shippingPrice = shipping;
            cart.taxPrice = tax;
            cart.totalPrice = Number(Number(cart.shippingPrice + cart.taxPrice) + Number(total)).toFixed();

            await Cart.findByIdAndUpdate(cartId, cart);
            res.status(200).json({message: "The Cart is successfully updated"});
        }

        else if(removeProduct || qty <= 0) {
            const cartUser = await Cart.findById(cartId);
            const newItems = cartUser.items.filter( item => item.product.toString() !== productId.toString() );
            if(newItems.length === 0) {
                await Cart.findByIdAndDelete(cartId);
                res.status(200).json({message: 'Cart successfuly deleted'});
            } else {
                cartUser.items = newItems;
                const total = Number(cartUser.items.reduce((acc, item) => item.price + acc, 0)).toFixed();
                const shipping = (total * 0.01).toFixed();
                const tax = (total * 0.03).toFixed();
                cartUser.shippingPrice = shipping;
                cartUser.taxPrice = tax;
                cartUser.totalPrice = Number(Number(cartUser.shippingPrice + cartUser.taxPrice) + Number(total)).toFixed();
                await Cart.findByIdAndUpdate(cartId, cartUser);
                res.status(200).json({message: "Product successfully deleted"});
            }
        };
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }

};

exports.deleteCart = async (req, res, next) => {
    try {
        const { cartId } = req.body;
        await Cart.findByIdAndDelete(cartId);
        res.status(200).json({message: 'Cart successfuly deleted'});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
};