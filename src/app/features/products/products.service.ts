import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly apiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}
