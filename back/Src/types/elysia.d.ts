import "elysia";

declare module "elysia" {
    interface Context {
        user :{
            id: number;
            role: string;
        };
    }
}