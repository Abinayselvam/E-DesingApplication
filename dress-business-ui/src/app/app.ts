import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName?: string;
  garmentType: string;
  designNotes?: string;
  quotedPrice: number;
  advancePaid: number;
  balanceDue: number;
  deliveryDate: string;
  status: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="container">
      <header class="hero">
        <p class="eyebrow">DRESS CUSTOMIZATION STUDIO</p>
        <h1>Business Dashboard</h1>
        <p>Manage customers, custom orders and delivery dates.</p>
      </header>

      <p class="message" *ngIf="message">{{ message }}</p>

      <section class="panel">
        <h2>Add customer</h2>

        <form (ngSubmit)="addCustomer()">
          <label>
            Customer name
            <input
              name="name"
              [(ngModel)]="customerForm.name"
              required
              minlength="2"
              maxlength="100"
            />
          </label>

          <label>
            Phone number
            <input
              name="phone"
              [(ngModel)]="customerForm.phone"
              required
              maxlength="15"
            />
          </label>

          <label>
            Email (optional)
            <input
              name="email"
              type="email"
              [(ngModel)]="customerForm.email"
              maxlength="150"
            />
          </label>

          <button type="submit" [disabled]="busy">
            Save customer
          </button>
        </form>
      </section>

      <section class="panel">
        <h2>Create custom order</h2>

        <form (ngSubmit)="addOrder()">
          <label>
            Customer
            <select
              name="customerId"
              [(ngModel)]="orderForm.customerId"
              required
            >
              <option [ngValue]="0" disabled>Select a customer</option>
              <option *ngFor="let c of customers" [ngValue]="c.id">
                {{ c.name }} — {{ c.phone }}
              </option>
            </select>
          </label>

          <label>
            Garment type
            <select
              name="garmentType"
              [(ngModel)]="orderForm.garmentType"
              required
            >
              <option value="Blouse">Blouse</option>
              <option value="Kurti">Kurti</option>
              <option value="Custom Dress">Custom dress</option>
              <option value="Gown">Gown</option>
              <option value="Alteration">Alteration</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Design notes
            <textarea
              name="designNotes"
              [(ngModel)]="orderForm.designNotes"
              maxlength="1000"
              placeholder="Describe the design, fabric and special requirements"
            ></textarea>
          </label>

          <label>
            Quoted price (₹)
            <input
              name="quotedPrice"
              type="number"
              min="1"
              max="10000000"
              step="0.01"
              [(ngModel)]="orderForm.quotedPrice"
              required
            />
          </label>

          <label>
            Advance received (₹)
            <input
              name="advancePaid"
              type="number"
              min="0"
              max="10000000"
              step="0.01"
              [(ngModel)]="orderForm.advancePaid"
              required
            />
          </label>

          <p class="hint">
            Suggested 50% advance:
            ₹{{ (orderForm.quotedPrice * 0.5 || 0) | number:'1.2-2' }}
          </p>

          <label>
            Promised delivery date
            <input
              name="deliveryDate"
              type="date"
              [(ngModel)]="orderForm.deliveryDate"
              [min]="today"
              required
            />
          </label>

          <button type="submit" [disabled]="busy || customers.length === 0">
            Create order
          </button>
        </form>
      </section>

      <section class="panel">
        <div class="section-heading">
          <h2>Customer orders</h2>
          <button type="button" class="secondary" (click)="loadData()">
            Refresh
          </button>
        </div>

        <p *ngIf="orders.length === 0">No orders yet.</p>

        <div class="order-list" *ngFor="let o of orders">
          <div class="section-heading">
            <strong>{{ o.orderNumber }}</strong>
            <span class="status">{{ o.status }}</span>
          </div>
          <p>{{ o.customerName }} · {{ o.garmentType }}</p>
          <p>Delivery: {{ o.deliveryDate | date:'mediumDate' }}</p>
          <div class="money">
            <span>Quoted: ₹{{ o.quotedPrice | number:'1.2-2' }}</span>
            <span>Advance: ₹{{ o.advancePaid | number:'1.2-2' }}</span>
            <strong>Balance: ₹{{ o.balanceDue | number:'1.2-2' }}</strong>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrl: './app.css'
})
export class App {
  private readonly api = 'http://localhost:5000/api';

  busy = false;
  message = '';

  customers: Customer[] = [];
  orders: Order[] = [];

  today = this.getLocalDate();

  customerForm = {
    name: '',
    phone: '',
    email: ''
  };

  orderForm = {
    customerId: 0,
    garmentType: 'Blouse',
    designNotes: '',
    quotedPrice: 1500,
    advancePaid: 750,
    deliveryDate: this.getDateAfterDays(7)
  };

  constructor(private http: HttpClient) {
    this.loadData();
  }

  private getLocalDate(): string {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000)
      .toISOString()
      .slice(0, 10);
  }

  private getDateAfterDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000)
      .toISOString()
      .slice(0, 10);
  }

  loadData(): void {
    this.http.get<Customer[]>(`${this.api}/customers`).subscribe({
      next: data => this.customers = data,
      error: () => this.message =
        'Could not load customers. Check whether the API and database are running.'
    });

    this.http.get<Order[]>(`${this.api}/orders`).subscribe({
      next: data => this.orders = data,
      error: () => this.message = 'Could not load orders.'
    });
  }

  addCustomer(): void {
    this.busy = true;
    this.message = '';

    this.http.post<Customer>(
      `${this.api}/customers`,
      this.customerForm
    ).subscribe({
      next: customer => {
        this.message = `Customer ${customer.name} saved.`;
        this.customerForm = { name: '', phone: '', email: '' };
        this.busy = false;
        this.loadData();
      },
      error: err => {
        this.message = err.error?.message || 'Could not save customer.';
        this.busy = false;
      }
    });
  }

  addOrder(): void {
    if (!this.orderForm.customerId) {
      this.message = 'Select a customer first.';
      return;
    }

    if (this.orderForm.advancePaid > this.orderForm.quotedPrice) {
      this.message = 'Advance cannot exceed the quoted price.';
      return;
    }

    this.busy = true;
    this.message = '';

    const payload = {
      ...this.orderForm,
      deliveryDate: `${this.orderForm.deliveryDate}T12:00:00`
    };

    this.http.post<Order>(
      `${this.api}/orders`,
      payload
    ).subscribe({
      next: order => {
        this.message = `Order ${order.orderNumber} created.`;
        this.orderForm.designNotes = '';
        this.busy = false;
        this.loadData();
      },
      error: err => {
        this.message = err.error?.message || 'Could not create order.';
        this.busy = false;
      }
    });
  }
}