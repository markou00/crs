'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { Customer } from './types';

interface Params {
  customerId: string;
}

export default function CustomerDetails({ params }: { params: Params }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch(`/api/customers/${params.customerId}`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data: Customer = await response.json();
        setCustomer(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    if (params?.customerId) {
      fetchCustomerData();
    }
  }, [params.customerId]);

  const deleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`/api/customers/${params.customerId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete the customer');

        // Optionally, redirect the user back to the customers list page or handle the UI update
        router.push('/customers'); // Adjust the path as necessary
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while deleting the customer');
        }
      }
    }
  };

  if (error) return <div>An error occurred: {error}</div>;
  if (!customer) return <div>Loading...</div>;

  return (
    <div>
      <h1>{customer.name}</h1>
      <p>Kontaktnavn: {customer.contactName}</p>
      <p>Epost: {customer.contactEmail}</p>
      <p>Tlf: {customer.contactPhone || 'N/A'}</p>
      <p>Adresse: {customer.address}</p>
      <p>Sted: {customer.city}</p>
      <p>Postnr: {customer.postalCode}</p>
      <p>Land: {customer.country}</p>
      <button type="button" onClick={deleteCustomer}>
        Delete Customer
      </button>
      <p>
        <Link href="/customers">Tilbake til kundesiden</Link>
      </p>
    </div>
  );
}
