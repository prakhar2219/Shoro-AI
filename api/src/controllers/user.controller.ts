import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import User from '../models/user.model';
import AppError from '../utils/appError';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const { password, role, ...updateData } = req.body;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
