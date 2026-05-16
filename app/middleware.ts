import NextAuth from "next-auth"
import {authConfig} from "@/auth";
import {NextRequest} from "next/server";

const { auth } = NextAuth(authConfig)
export default auth(async function middleware(req: NextRequest) {
    // Your custom middleware logic goes here

    console.log("hello")
})

export const config = {
    matcher: "/api"
}
