import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleGuard extends AuthGuard( 'googleStrategy' ) {}
// AuthGuard est une fonction mixin: 