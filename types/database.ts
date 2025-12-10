export interface User {
  user_id?: string;
  full_name: string;
  address?: string;
  registration_date?: string;
}

export interface Product {
  product_id?: string;
  product_name: string;
  price: number;
  manufacturing_date?: string;
}

export interface ShoppingCart {
  cart_id?: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_date?: string;
}

export interface Image {
  image_id?: string;
  filename: string;
  url: string;
  uploaded_at?: string;
}

export interface ExternalUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}