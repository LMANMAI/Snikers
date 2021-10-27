import React, { useEffect, useState } from "react";
import {
  CartPageContainer,
  CartBoxItemsContainer,
  CartButton,
  CartPageShop,
  ImgShopContainer,
  DeleteButton,
} from "../../styles";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectBasket,
  selectTotalCart,
  removeSneakerBasket,
} from "../../features/sneakersSlice";
import { ISneaker } from "../../interfaces";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "../../config/axios";

const CartPage: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const sneakers = useSelector(selectBasket);
  const totalCart = useSelector(selectTotalCart);

  //stripe
  const stripe = useStripe();
  const elements = useElements();
  //states
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [processing, setProcessing] = useState<boolean | string>();
  const [succeded, setSucceded] = useState(false);
  const [clientsecret, setClientSecret] = useState<any>();
  //functions

  const handleRemove = (snesaker: ISneaker) => {
    dispatch(removeSneakerBasket(snesaker));
  };
  useEffect(() => {
    const getClientSecret = async () => {
      const response = await axios({
        method: "post",
        url: `/payments/create?total=${totalCart * 100}`,
      });
      setClientSecret(response.data.clientSecret);
    };
    getClientSecret();
  }, [sneakers]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setProcessing(true);
    const payload = await stripe
      ?.confirmCardPayment(clientsecret, {
        payment_method: { card: elements?.getElement?(CardElement) },
      })
      .then(({ paymentIntent }) => {
        setSucceded(true);
        setError(null);
        setProcessing(false);
        history.replace("/");
      });
  };
  const handleChange = (event: any) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  return (
    <main>
      <CartPageContainer>
        <CartBoxItemsContainer>
          {sneakers.length === 0 ? (
            <div className="message_container">
              <h3>Tu carrito está vacío</h3>
              <p>¿No sabés qué comprar? ¡Miles de productos te esperan!</p>
            </div>
          ) : (
            sneakers.map((sneaker) => (
              <CartPageShop key={sneaker._id}>
                <ImgShopContainer>
                  <img src={sneaker.imageURL} alt={sneaker.name} />
                </ImgShopContainer>
                <div>
                  <p>{sneaker.name}</p>
                  <DeleteButton onClick={() => handleRemove(sneaker)}>
                    Eliminar
                  </DeleteButton>
                </div>
                <span>${sneaker.price}</span>
              </CartPageShop>
            ))
          )}
        </CartBoxItemsContainer>
        {totalCart > 0 && (
          <>
            <CartPageShop className="total_shop">
              <span>Total: </span>
              <p>$ {totalCart}</p>
            </CartPageShop>
            <div className="payment_section">
              <div className="payment_tittle">
                <h3>Metodos de pago</h3>
              </div>
              <div className="payment_details">
                <form onSubmit={handleSubmit}>
                  <CardElement onChange={handleChange} />
                </form>
              </div>
            </div>
          </>
        )}

        <CartButton
          type="button"
          disabled={
            sneakers.length === 0 || processing || disabled || succeded
              ? true
              : false
          }
        >
          {processing ? "Procesando" : "Comprar carrito"}
        </CartButton>
      </CartPageContainer>
    </main>
  );
};

export default CartPage;
