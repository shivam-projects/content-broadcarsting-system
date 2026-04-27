const router = require("express").Router();
const { verifyToken } = require("../middlewares/authetication");
const { allowRoles } = require("../middlewares/role");
const { pool } = require("../config/db");

router.post(
  "/action/:id",
  verifyToken,
  allowRoles("PRINCIPAL"),
  async (req, res) => {
    try {
      const { action, reason } = req.body;

      // Validate action
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ msg: "Invalid action" });
      }

      // Check content exists + pending
      const { rows } = await pool.query(
        "SELECT status FROM content WHERE id=$1",
        [req.params.id]
      );

      if (!rows.length) {
        return res.status(404).json({ msg: "Content not found" });
      }

      if (rows[0].status !== "pending") {
        return res.status(400).json({
          msg: "Only pending content can be reviewed",
        });
      }

      // Approve
      if (action === "approve") {
        await pool.query(
          `UPDATE content
           SET status='approved',
               approved_by=$1,
               approved_at=NOW(),
               rejection_reason=NULL
           WHERE id=$2`,
          [req.user.id, req.params.id]
        );

        return res.json({ msg: "Approved successfully" });
      }

      // Reject
      if (!reason) {
        return res.status(400).json({
          msg: "Rejection reason required",
        });
      }

      await pool.query(
        `UPDATE content
         SET status='rejected',
             rejection_reason=$1,
             approved_by=NULL,
             approved_at=NULL
         WHERE id=$2`,
        [reason, req.params.id]
      );

      return res.json({ msg: "Rejected successfully" });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Error reviewing content" });
    }
  }
);


 
module.exports = router;