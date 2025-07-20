const User = require("../modals/user");
require("dotenv").config();
async function getAllUsers(req, res) {
  try {
    const users = await User.find({ role: "user",  isDeleted: { $ne: true }}).select("fullName email isActive");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /users/toggle-user/:id
async function toggleUser (req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({ message: 'User status updated', isActive: user.isActive });
};
//soft delete
 async function softDeleteUser(req, res){
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User soft-deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /users/edit/:id
async function editUser(req, res) {
  try {
    const userId = req.params.id;
    const { fullName, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Edit error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


module.exports = {
  getAllUsers,
  toggleUser,
  softDeleteUser,
  editUser
};