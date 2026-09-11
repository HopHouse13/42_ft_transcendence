import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtGuard extends AuthGuard( 'jwt' ) {}

// AuthGuard est une fonction "mixin" qui va générer une class intermediaire etendu a JwtGuard configuré pour utiliser la strategie "jwt" (JwtStrategy)
// JwtGuard intercepte la requête avant qu'elle atteigne le controller, et déclenche la stratégie 'jwt' pour vérifier le token