import axios from 'axios';


const openai = axios.create({
  baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    // Add other headers here
  },
//   withCredentials: true,
});

export default openai;