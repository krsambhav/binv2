import React, { useState } from 'react';
import axios from 'axios';

const BinChecker = () => {
  const [bin, setBin] = useState('');
  const [cardDetails, setCardDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    // if (bin.length !== 6) {
    //   setError('Please enter a valid 6-digit BIN');
    //   setLoading(false);
    //   return;
    // }

    const cardNumber = generateCardNumber(bin.slice(0,6));
    console.log(cardNumber)
    const expiry = generateRandomExpiry();
    const cvv = generateRandomCVV();
    
    const data = {
      type: 'card',
      number: cardNumber,
      expiry_month: expiry.month,
      expiry_year: expiry.year,
      cvv: cvv,
      name: 'John Doe',
      billing_address: null,
      phone: {}
    };

    try {
      const response = await axios.post('https://api.checkout.com/tokens', data, {
        headers: {
          'Authorization': 'pk_8293d6b0-ea88-4afa-8419-5f4bfeb61afe',
          'Content-Type': 'application/json'
        }
      });
      setCardDetails(response.data);
    } catch (err) {
      setError('Failed to retrieve card details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-600 p-8">
      <div className="glassmorphism p-6 max-w-lg w-full rounded-lg shadow-xl transition-all">
        <h1 className="text-3xl font-bold text-white text-center mb-6">BIN Checker</h1>
        <div className="mb-4">
          <label className="block text-lg text-gray-200 mb-2">Enter BIN / Card Number:</label>
          <input
            type="text"
            value={bin}
            onChange={(e) => setBin(e.target.value)}
            className="w-full border border-transparent p-3 rounded-lg bg-white/30 text-white placeholder-white focus:outline-none focus:border-white transition-all shadow-lg"
            placeholder="e.g. 526873"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-3 mt-2 text-lg font-semibold bg-white text-indigo-700 rounded-lg shadow-lg hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
        
        {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      </div>

      {cardDetails && (
        <div className="mt-8 p-6 w-full max-w-lg bg-black rounded-lg shadow-lg backdrop-blur-md transition-all">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Card Details</h2>
          <div className="space-y-2">
            {/* <p className="text-lg text-white"><strong>Token:</strong> {cardDetails.token}</p> */}
            <p className="text-lg text-white"><strong>Bank:</strong> {cardDetails.issuer}</p>
            <p className="text-lg text-white"><strong>Scheme:</strong> {cardDetails.scheme}</p>
            {/* <p className="text-lg text-white"><strong>Last 4:</strong> {cardDetails.last4}</p> */}
            <p className="text-lg text-white"><strong>Card Type:</strong> {cardDetails.card_type}</p>
            <p className="text-lg text-white"><strong>Level:</strong> {cardDetails.product_type}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Generate card number with Luhn’s algorithm
const generateCardNumber = (bin) => {
  // Generate the first 9 random digits after the bin
  let number = bin + Math.floor(Math.random() * 1e9).toString().padStart(9, '0');

  let sum = 0;
  let shouldDouble = true; // Luhn's algorithm works from right to left, so start doubling from the next-to-last digit
  
  // Loop over the card number (excluding the last check digit that we will calculate)
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9; // Subtract 9 if the doubled digit is greater than 9
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble; // Alternate between doubling and not doubling
  }

  // Calculate the check digit that will make the sum a multiple of 10
  const checkDigit = (10 - (sum % 10)) % 10;

  // Return the complete valid card number
  return number + checkDigit;
};

// Generate random expiry date
const generateRandomExpiry = () => {
  const month = ('0' + Math.floor(Math.random() * 12 + 1)).slice(-2);
  const year = new Date().getFullYear() + Math.floor(Math.random() * 5 + 1);
  return { month, year };
};

// Generate random CVV
const generateRandomCVV = () => Math.floor(100 + Math.random() * 900).toString();

export default BinChecker;
