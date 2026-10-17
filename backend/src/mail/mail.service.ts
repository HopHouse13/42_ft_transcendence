import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService
{
	private	transporter!: Transporter;

	constructor( private configService: ConfigService )
	{
		this.transporter = nodemailer.createTransport(
		{
			host:	configService.getOrThrow<string>( 'MAIL_HOST' ),
			port:	parseInt( configService.getOrThrow<string>( 'MAIL_PORT' ), 10),
			auth:
			{
				user:	configService.getOrThrow<string>( 'MAIL_USER' ),
				pass:	configService.getOrThrow<string>( 'MAIL_PASS' )
			}
		});
	}

	///

	async	sendResetPasswordEmail( email: string, resetLink: string )
	{
		await	this.transporter.sendMail(
		{	
			from:		this.configService.getOrThrow<string>( 'MAIL_FROM' ),
			to:			email,
			subject:	'Password reset',
			text:		`Click this link to reset your password (valid for 10 minutes):\n${ resetLink }`
		});
	}
};