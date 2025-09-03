import { inject, Injectable } from '@angular/core';
import { Vendor } from '../../shared/models/vendor';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getVendorProfile() {
    return this.http.get<Vendor>(this.baseUrl + 'vendor/profile');
  }

}
