import { bootstrapApplication } from '@angular/platform-browser';
import { Client } from './Client';

bootstrapApplication(Client, {
  providers: []
}).catch(err => console.error(err));
