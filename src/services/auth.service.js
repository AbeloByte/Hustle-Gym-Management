import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// Registration function
export const registerService = async ({ name, email, password, role }) => {

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("User already exists");
    }

    // hash password

    const hashedPass = await bcrypt.hash(password, 10)

    // create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPass,
            role
        },
    })
    return user;

}

// Login
export const loginService = async ({ email, password }) => {

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid credentials");

    // check pass
    const validpass = await bcrypt.compare(password, user.password)
    if (!validpass) throw new Error("Invalid credentials");

    // token
    const token = jwt.sign({
        id: user.id,
        role: user.role
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );


    return {
        token,
        user: {
            id: user.id,
            name : user.name,
            role : user.role
        }
    }
}




// export default { registerService, loginService}
