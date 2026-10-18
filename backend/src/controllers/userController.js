const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'avatar', 'healthProfile', 'phone'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  return success(res, 'Profile updated', { user: user.toSafeObject() });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return error(res, 'User not found', 404);

  const address = user.addresses.id(req.params.addressId) || user.addresses.find((a) => a._id?.toString() === req.params.addressId);
  if (!address) return error(res, 'Address not found', 404);

  user.addresses.forEach((a) => (a.isDefault = a._id.toString() === address._id.toString()));
  await user.save();
  return success(res, 'Default address set', { addresses: user.addresses, activeAddress: address });
});

const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return error(res, 'User not found', 404);

  const isDefault = req.body.isDefault || user.addresses.length === 0;
  if (isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses.push({
    label: req.body.label || 'Home',
    addressLine: req.body.addressLine,
    city: req.body.city || 'Chennai',
    state: req.body.state || 'Tamil Nadu',
    pincode: req.body.pincode || '600001',
    isDefault,
  });

  await user.save();
  return success(res, 'Address added', { addresses: user.addresses }, 201);
});

const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return error(res, 'User not found', 404);

  const address = user.addresses.id(req.params.addressId) || user.addresses.find((a) => a._id?.toString() === req.params.addressId);
  if (!address) return error(res, 'Address not found', 404);

  if (req.body.label) address.label = req.body.label;
  if (req.body.addressLine) address.addressLine = req.body.addressLine;
  if (req.body.city) address.city = req.body.city;
  if (req.body.state) address.state = req.body.state;
  if (req.body.pincode) address.pincode = req.body.pincode;

  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = a._id.toString() === address._id.toString()));
  }

  await user.save();
  return success(res, 'Address updated successfully', { addresses: user.addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return error(res, 'User not found', 404);

  user.addresses = user.addresses.filter((a) => a._id?.toString() !== req.params.addressId);
  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return success(res, 'Address removed', { addresses: user.addresses });
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { foodId } = req.body;
  const idx = user.wishlist.findIndex((f) => f.toString() === foodId);
  if (idx >= 0) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(foodId);
  }
  await user.save();
  return success(res, 'Wishlist updated', { wishlist: user.wishlist });
});

const toggleFavoriteChef = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { chefId } = req.body;
  const idx = user.favoriteChefs.findIndex((c) => c.toString() === chefId);
  if (idx >= 0) {
    user.favoriteChefs.splice(idx, 1);
  } else {
    user.favoriteChefs.push(chefId);
  }
  await user.save();
  return success(res, 'Favorite chefs updated', { favoriteChefs: user.favoriteChefs });
});

module.exports = { updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress, toggleWishlist, toggleFavoriteChef };
