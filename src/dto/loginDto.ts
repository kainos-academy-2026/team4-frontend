import { z } from "zod";

export const LoginRequestSchema = z.object({
	email: z
		.string()
		.min(1, "Please enter both your email and password.")
		.email("Please enter a valid email address."),
	password: z.string().min(1, "Please enter both your email and password."),
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

export type LoginResponseDto = {
	token: string;
};
