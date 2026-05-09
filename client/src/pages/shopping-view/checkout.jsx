import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);

  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);

  const dispatch = useDispatch();
  const { toast } = useToast();

  // ✅ TOTAL CALCULATION
  const totalCartAmount =
    cartItems?.items?.length > 0
      ? cartItems.items.reduce((sum, currentItem) => {
          const price =
            currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price;

          return sum + price * currentItem?.quantity;
        }, 0)
      : 0;

  function handleInitiatePaypalPayment() {
    // ❌ VALIDATIONS
    if (!cartItems?.items?.length) {
      toast({
        title: "Cart is empty",
        variant: "destructive",
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: "Select address first",
        variant: "destructive",
      });
      return;
    }

    console.log("USER:", user);
    console.log("CART ITEMS:", cartItems);
    console.log("ADDRESS:", currentSelectedAddress);

    // ✅ ORDER DATA (FIXED with user.id)
    const orderData = {
      userId: user?.id,                 // ✅ FIXED (your required format)
      cartId: cartItems?.id,           // ✅ safe fallback if backend sets id

      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item?.salePrice > 0 ? item?.salePrice : item?.price,
        quantity: item?.quantity,
      })),

      addressInfo: {
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },

      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
    };

    console.log("FINAL ORDER DATA:", orderData);

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymentStart(true);
      }
    });
  }

  // ✅ PAYPAL REDIRECT FIX
  useEffect(() => {
    if (approvalURL) {
      window.location.href = approvalURL;
    }
  }, [approvalURL]);

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5">
        {/* ADDRESS */}
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />

        {/* CART */}
        <div className="flex flex-col gap-4">
          {cartItems?.items?.map((item) => (
            <UserCartItemsContent
              key={item.productId || item._id}
              cartItem={item}
            />
          ))}

          {/* TOTAL */}
          <div className="flex justify-between font-bold mt-4">
            <span>Total</span>
            <span>${totalCartAmount}</span>
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleInitiatePaypalPayment}
            disabled={isPaymentStart}
          >
            {isPaymentStart ? "Processing..." : "Pay with PayPal"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;