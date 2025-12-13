import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { App } from './app';

/**
 * NOTE: This is an example App Module.
 * Since this project is configured for Standalone Components (via bootstrapApplication),
 * this module might not be used unless you switch the bootstrap method.
 */
@NgModule({
    declarations: [],
    imports: [
        BrowserModule,
        AppRoutingModule,
        App
    ],
    providers: [],
    bootstrap: [App]
})
export class AppModule { }
