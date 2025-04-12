const { getAllOrder } = require("./orderService");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter"); // Import plugin isSameOrAfter

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter); // Sử dụng plugin isSameOrAfter

const getOrderStatistics = async () => {
  try {
    // Lấy tất cả đơn hàng
    const { success, orders } = await getAllOrder();
    if (!success || orders.length === 0) {
      // Trả về thống kê mặc định nếu không có đơn hàng
      return {
        success: true,
        statistics: {
          totalOrdersToday: 0,
          totalRevenueToday: 0,
          totalOrdersThisWeek: 0,
          totalRevenueThisWeek: 0,
        },
      };
    }

    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const startOfToday = now.startOf("day");
    const startOfWeek = now.startOf("week");

    // Tính toán thống kê
    const statistics = {
      totalOrdersToday: 0,
      totalRevenueToday: 0,
      totalOrdersThisWeek: 0,
      totalRevenueThisWeek: 0,
    };

    const validStatus = "Done";

    orders.forEach((order) => {
      const orderDate = dayjs(new Date(order.created_at)).tz(
        "Asia/Ho_Chi_Minh"
      );

      if (!orderDate.isValid()) {
        console.warn(`Ngày tạo đơn hàng không hợp lệ: ${order.created_at}`);
        return;
      }

      const isValidOrder = order.order_status === validStatus;

      if (orderDate.isSameOrAfter(startOfToday)) {
        statistics.totalOrdersToday += 1;
        if (isValidOrder) {
          statistics.totalRevenueToday += parseFloat(order.total_price);
        }
      }

      if (orderDate.isSameOrAfter(startOfWeek)) {
        statistics.totalOrdersThisWeek += 1;
        if (isValidOrder) {
          statistics.totalRevenueThisWeek += parseFloat(order.total_price);
        }
      }
    });

    return { success: true, statistics };
  } catch (error) {
    console.error("Error in getOrderStatistics service:", error.message);
    throw new Error(
      error.message || "Đã xảy ra lỗi khi tính toán thống kê đơn hàng."
    );
  }
};

module.exports = {
  getOrderStatistics,
};
