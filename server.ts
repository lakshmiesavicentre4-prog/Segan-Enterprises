import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/create-cashfree-session", async (req, res) => {
    const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({ error: "orderId and amount are required" });
    }

    try {
      const isProd = process.env.CASHFREE_ENVIRONMENT === "PROD" || process.env.CASHFREE_ENVIRONMENT === "prod";
      const baseUrl = isProd ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders";

      const payload = {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: orderId + "-CUST",
          customer_name: customerName || "Customer",
          customer_email: customerEmail || "customer@example.com",
          customer_phone: customerPhone || "9999999999"
        },
        order_meta: {
          return_url: "https://your-domain.com/payment-status?order_id={order_id}"
        }
      };

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2023-08-01",
          "x-client-id": process.env.CASHFREE_APP_ID!,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY!
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create Cashfree order");
      }

      res.json({ payment_session_id: data.payment_session_id });
    } catch (error: any) {
      console.error("Cashfree order creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support Express 4 / Express 5 by using '*' for catch all route
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
