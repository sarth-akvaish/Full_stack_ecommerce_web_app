import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { VscError } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartItemCard from "../components/cartItem";
import {
  addToCart,
  applyDiscount,
  calculatePrice,
  removeCartItems,
} from "../redux/reducer/cartReducer";
import { RootState, server } from "../redux/store";
import { CartItem } from "../types/types";

const Cart = () => {
  const dispatch = useDispatch();

  const { cartItems, discount, shippingCharges, subtotal, tax, total } =
    useSelector(
      (state: RootState) => state.cartReducer
    );
  const [couponCode, setcouponCode] = useState<string>("");
  const [isValidCoupon, setisValidCoupon] = useState<boolean>(false);

  const incrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity >= cartItem.stock)
      return toast.error("Stock limit reached");
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity + 1 }));
  };

  const decrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity <= 1) return;
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity - 1 }));
  };

  const deleteHandler = (productID: string) => {
    dispatch(removeCartItems(productID));
  };

  useEffect(() => {
    const { token, cancel } = axios.CancelToken.source();

    const timeOutId = setTimeout(() => {
      axios
        .get(`${server}/api/v1/payment/discount?coupon=${couponCode}`, {
          cancelToken: token,
        })
        .then((res) => {
          dispatch(applyDiscount(res.data.discount));
          dispatch(calculatePrice());
          setisValidCoupon(true);
        })
        .catch(() => {
          dispatch(applyDiscount(0));
          dispatch(calculatePrice());
          setisValidCoupon(false);
        });
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
      cancel();
      setisValidCoupon(false);
    };
  }, [couponCode]);

  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems]);

  return (
    <div className="cart">
      <main>
        {cartItems.length > 0 ? (
          cartItems.map((i, index) => (
            <CartItemCard
              incrementHandler={incrementHandler}
              decrementHandler={decrementHandler}
              deleteHandler={deleteHandler}
              key={index}
              cartItem={i}
            />
          ))
        ) : (
          <h1>No Items Added...</h1>
        )}
      </main>
      <aside>
        <p>Subtotal : ₹{subtotal}</p>
        <p>Tax : ₹{tax}</p>
        <p>ShippingCharges : ₹{shippingCharges}</p>
        <p>
          Discount : <em className="red"> - ₹{discount}</em>
        </p>
        <p>
          {" "}
          <b>Total : ₹{total}</b>
        </p>
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setcouponCode(e.target.value)}
          placeholder="Coupon Code"
        />
        {couponCode &&
          (isValidCoupon ? (
            <span className="green">
              ₹{discount} off using the <code>{couponCode}</code>
            </span>
          ) : (
            <span className="red">
              Invalid Coupon <VscError />
            </span>
          ))}
        {cartItems.length > 0 && <Link to={"/shipping"}>Checkout</Link>}
      </aside>
    </div>
  );
};

export default Cart;
