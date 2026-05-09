import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { checkAuth } from "@/store/auth-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

function PaypalReturnPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  useEffect(() => {
    // 🔥 STEP 1: refresh login state after PayPal redirect
    dispatch(checkAuth());

    // 🔥 STEP 2: capture payment
    if (paymentId && payerId) {
      const orderId = JSON.parse(
        sessionStorage.getItem("currentOrderId") || "null"
      );

      if (!orderId) return;

      dispatch(capturePayment({ paymentId, payerId, orderId })).then(
        (data) => {
          if (data?.payload?.success) {
            sessionStorage.removeItem("currentOrderId");

            // 🔥 STEP 3: go to success page safely
            navigate("/shop/payment-success");
          }
        }
      );
    }
  }, [paymentId, payerId, dispatch, navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Payment... Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default PaypalReturnPage;