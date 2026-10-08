import adminServices from "../services/admin.services.js";

const dashboardController = async (req, res) => {
  try {
    const dashboard = await adminServices.dashboardService();
    return res.status(200).json({ dashboard });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export default { dashboardController };
