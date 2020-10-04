const Cart = require('../models/cart');

exports.postCart = async (req, res, next) => {
    const userId = req.body.userId;
    const productId = req.body.productId;

    const userCart = await Cart.find({user: userId});
    console.log(userCart)
    if (userCart) {
        const _id = userCart._id
        const product = await Cart.find({_id: _id, cart: [{product: productId}]});
        console.log(product);
        if (product) {
            const newQuantity = product.carts.quantity + 1
            product.carts.quantity = newQuantity;
            const newProduct = new Cart(product);
            await newProduct.save();
        } else {
            const newUserCart = userCart.push({
                carts: [
                    {
                        product: productId,
                        quantity: 1
                    }
                ]
            });
            const userCartModel = new Cart(newUserCart);
            await userCartModel.save();
        }
    }
    const newCart = {
        user: userId,
        carts: [
            {
                product: productId,
                quantity: 1
            }
        ]
    }
    await newCart.save();
}