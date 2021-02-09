const router = require("express").Router();
const adminController = require("../controllers/adminController");

router.get("/dashboard", adminController.viewDashboard);

//endpoint input pasien
router.get("/form", adminController.viewForm);
router.post("/form", adminController.addData);
router.put("/form", adminController.editData);
router.delete("/form/:id", adminController.deleteData);

//endpoint download rekap
router.get("/form/download", adminController.exportData);

module.exports = router;
