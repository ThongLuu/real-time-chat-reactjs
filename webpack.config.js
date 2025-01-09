const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js", // Điểm đầu vào
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // Thư mục đầu ra
    clean: true, // Dọn sạch thư mục trước mỗi lần build
  },
  mode: "development", // Chế độ phát triển
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Xử lý file .js và .jsx
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/, // Xử lý file CSS
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"], // Hỗ trợ cả file .js và .jsx
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", // Trỏ đến file HTML trong thư mục public
      filename: "index.html", // Đầu ra HTML trong dist/
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"), // Serve các tệp tĩnh trong public/
    },
    port: 3000,
    open: true, // Tự động mở trình duyệt
    hot: true, // Hỗ trợ Hot Module Replacement
  },
};
