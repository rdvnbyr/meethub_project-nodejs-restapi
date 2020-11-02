const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/products');
const colors = require('colors');
const stripe = require('stripe')('sk_test_51HgxbAEraGwCsF1w704UxMC7Ck6OgrZb7wGUqh5CnzWQmGPrEtBzWpjb5tyI7A06cow9RPfrafy9hGjNfN5284pZ00pCYcuYtN');

exports.payment = async (req,res,next) => {
    try {
        const {data, price} = req.body;
        console.log(price)
        console.log(data);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price,
            currency: "eur"
          });
        console.log(paymentIntent)
        res.send({
            clientSecret: paymentIntent.client_secret
          });
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
        const cart = await Cart.find({customer: userId}).populate('customer').populate({path: 'items', populate: {path: 'product', model: 'Products'}});
        res.status(200).json(cart);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
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
                totalPrice: (product.price * 1) + (product.price * 0.01) + (product.price * 0.03),
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
            console.log(isAlreadyAdded);
            if( !(isAlreadyAdded >= 0) ) {
                res.status(409).json({message: "Product already added"});
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
        const { userId, productId, qty, cartId, removeProduct } = req.body;
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

/* exports.deleteItemFromCart = async (req, res, next) => {
    try {
        const { userId, productId, cartId } = req.body;

        const cartFindandDelete = await Cart.findByIdAndUpdate(cartId,
            {
                customer: userId,
                items: [
                    {
                        product: productId,
                        isActive: false
                    }
                ]
            }
        );
        const cartSave = await cartFindandDelete.save();
        res.status(200).json(cartSave);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
}; */




// exports.xpostCartx = async (req, res, next) => {
//     const userId = req.body.userId;
//     const productId = req.body.productId;

//     const userCart = await Cart.find({user: userId});
//     console.log(userCart)
//     if (userCart) {
//         const _id = userCart._id
//         const product = await Cart.find({_id: _id, cart: [{product: productId}]});
//         console.log(product);
//         if (product) {
//             const newQuantity = product.carts.quantity + 1
//             product.carts.quantity = newQuantity;
//             const newProduct = new Cart(product);
//             await newProduct.save();
//         } else {
//             const newUserCart = userCart.push({
//                 carts: [
//                     {
//                         product: productId,
//                         quantity: 1
//                     }
//                 ]
//             });
//             const userCartModel = new Cart(newUserCart);
//             await userCartModel.save();
//         }
//     }
//     const newCart = {
//         user: userId,
//         carts: [
//             {
//                 product: productId,
//                 quantity: 1
//             }
//         ]
//     }
//     await newCart.save();
// }