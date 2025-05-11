const express = require('express');
const app = express();
const port = 3000;

// Dữ liệu sản phẩm mẫu
const products = [
  { id: 1, name: 'Socola đen', description: 'Ngọt ngào đậm vị', price: 50000, image:'https://cf.shopee.vn/file/bbe52f31bf18be48c1a09f9537e0be0a' },
  { id: 2, name: 'Kẹo dẻo trái cây', description: 'Dẻo thơm hấp dẫn', price: 40000, image: 'https://m.media-amazon.com/images/I/61P12b5P4FL._SL1000_.jpg' },
  // Thêm các sản phẩm bánh kẹo khác vào đây
];

// API để lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API để lấy chi tiết sản phẩm theo ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Sản phẩm không tồn tại!' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
