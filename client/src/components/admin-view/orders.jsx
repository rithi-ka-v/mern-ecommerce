import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";

function AdminOrdersView() {
  const dispatch = useDispatch();

  const { orderList, orderDetails } = useSelector(
    (state) => state.adminOrder
  );

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  // ✅ Load all orders
  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  // ✅ Open dialog when order details arrive
  useEffect(() => {
    if (orderDetails) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  function handleFetchOrderDetails(id) {
    dispatch(getOrderDetailsForAdmin(id));
  }

  function handleCloseDialog() {
    setOpenDetailsDialog(false);
    dispatch(resetOrderDetails());
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orderList && orderList.length > 0 ? (
              orderList.map((orderItem) => (
                <TableRow key={orderItem._id}>
                  <TableCell>{orderItem._id}</TableCell>

                  <TableCell>
                    {orderItem?.orderDate
                      ? orderItem.orderDate.split("T")[0]
                      : "N/A"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`py-1 px-3 ${
                        orderItem?.orderStatus === "confirmed"
                          ? "bg-green-500"
                          : orderItem?.orderStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-black"
                      }`}
                    >
                      {orderItem?.orderStatus}
                    </Badge>
                  </TableCell>

                  <TableCell>${orderItem?.totalAmount}</TableCell>

                  <TableCell>
                    <Button
                      onClick={() =>
                        handleFetchOrderDetails(orderItem._id)
                      }
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No Orders Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* ✅ SINGLE dialog (outside loop) */}
      <Dialog open={openDetailsDialog} onOpenChange={handleCloseDialog}>
        <AdminOrderDetailsView orderDetails={orderDetails} />
      </Dialog>
    </Card>
  );
}

export default AdminOrdersView;