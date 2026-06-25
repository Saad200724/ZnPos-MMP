---
name: MongoDB Atlas database name
description: The Atlas cluster URI must include /mew-mew-pos before the query string, or Mongoose hits the default 'test' database which has unrelated e-commerce data with a different schema.
---

The MongoDB Atlas cluster at meowmeowpetshop.ypghsvp.mongodb.net already contained an existing e-commerce application's data (products with description/categoryId/brandId instead of sku/brand/category).

**Why:** Without a database name in the URI, MongoDB defaults to the `test` database. The cluster's `test` (or default) database had pre-existing collections that didn't match the POS schema, so `Product.find()` returned documents without `sku`, causing Zod/Mongoose validation failures.

**How to apply:** Always use the full URI with database name: `mongodb+srv://<user>:<pass>@<host>/mew-mew-pos?retryWrites=true&w=majority&appName=MeowMeowPetShop`. This is stored as the `MONGODB_URI` shared environment variable.
