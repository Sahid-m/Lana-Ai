import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_PUBLIC_KEY =
  process.env.JWT_PUBLIC_KEY ??
  `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw50fkkTFeRms0mCLm2ww
KLVZ8QZVBXJ024FQkImAS5PQ8yHew8asPR/n4JxscGFKgWL3GAzq+0dg6G/g4u4z
YhBvxul5wC5YMr7UJ1Aosgnu1yCpzaLJzMB2k4E62gRFD9h3ABpvcMIVrcINN/ok
52Kyl6grfedhrr9pN9ZFEW1St0P4xI9nirHHLbDxFRXxb9iZUUUccrevmP2zHp8e
ACjR+qtvagWqH9GBmoHVqkYM5olYzH5Vhm4viTYo/neYT/2MK4Q3bG4hsFou8CIN
aDwA7eooiO6pRGlsBx8BYnGe9EbRiWYovTjHXVvVMvrrIEGoPd4sky8xEi6eMGiC
LwIDAQAB
-----END PUBLIC KEY-----
`;

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(JWT_PUBLIC_KEY);
  const authHeader = req.headers.authorization; // Bearer token
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY ?? "asf", {
      algorithms: ["RS256"],
    });

    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = (decoded as any).sub;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.userId = userId;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: "Unauthorized" });
  }
}
