import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Category = {
  id: string;
  name: string;
  slug: string;
};
export type Product = {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
};

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly apiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  findOne(id: number) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
