const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/products');


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
        
        const user = await User.findById(userId);
        const product = await Product.findById(productId);
        
        if (!user || !product) {
            const error = new Error('Product or User not found');
            error.statusCode = 404;
            throw error;
        }

        const newCart = new Cart({
            customer: user._id,
            items: [
                {
                    product: product._id,
                    quantity: 1
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
            totalPrice: (product.price * 1) + (product.price * 0.03) + (product.price * 0.05) ,
            shippingPrice: parseFloat(product.price * 0.03).toFixed(),
            taxPrice: parseFloat(product.price * 0.05).toFixed(),
            shippingAt: '',
            paidAt: '',
            deliveredAt: '',
            isPaid: false,
            isDelivered: false
        })

        await newCart.save();
        res.status(200).json(newCart);

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
        // const cartFind = await Cart.findById(cartId, 
        //     {
        //         customer: userId,
        //         items: [
        //             {
        //                 product: productId
        //             }
        //         ]
        //     }
        // );
        // let currentQty = cartFind.items[0].quantity;
        
        if(qty) {
            const cartx = await Cart.findByIdAndUpdate(cartId,
                {
                    customer: userId,
                    items: [
                        {
                            product: productId,
                            quantity: qty
                        }
                    ]
                }
            );
            const cartSave = await cartx.save();
            res.status(200).json(cartSave);
        }

        if(removeProduct) {
            const carty = await Cart.findByIdAndUpdate(cartId,
                {
                    customer: userId,
                    items: [
                        {
                            product: productId,
                            quantity: 0,
                            isActive: false
                        }
                    ]
                }
            );
            const cartSave = await carty.save();
            res.status(200).json(cartSave);
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }

};

// exports.deleteItemFromCart = async (req, res, next) => {
//     try {
//         const { userId, productId, cartId } = req.body;

//         const cartFindandDelete = await Cart.findByIdAndUpdate(cartId,
//             {
//                 customer: userId,
//                 items: [
//                     {
//                         product: productId,
//                         isActive: false
//                     }
//                 ]
//             }
//         );
//         const cartSave = await cartFindandDelete.save();
//         res.status(200).json(cartSave);
//     } catch (error) {
//         if (!error.statusCode) {
//             error.statusCode = 500;
//         };
//         next(error);
//     }
// };

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