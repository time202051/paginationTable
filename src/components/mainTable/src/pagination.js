/*
 * @fileName: pagination.js
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:23:55
 * @version:
 * @description:分页
 */
// interface PaginationData {
//   total: Number;
//   pageIndex: Number;
//   pageSize: Number;
// }
// total：表示数据集中的总项目数。
// pageSize：表示每页显示的项目数。
// pageIndex：表示当前页码，默认为 1。
export default class Pagination {
  constructor(total = 0, pageSize = 20, pageIndex = 1) {
    this.total = total
    this.pageSize = pageSize
    this.pageIndex = pageIndex
  }

  getTotalPages() {
    return Math.ceil(this.total / this.pageSize)
  }

  getCurrentPage() {
    return this.pageIndex
  }

  setCurrentPage(page) {
    if (page > 0 && page <= this.getTotalPages()) {
      this.pageIndex = page
    }
  }

  getItemsOnCurrentPage() {
    const startIndex = (this.pageIndex - 1) * this.pageSize
    const endIndex = startIndex + this.pageSize
    return this.total.slice(startIndex, endIndex)
  }

  getNextPage() {
    if (this.pageIndex < this.getTotalPages()) {
      this.pageIndex = this.pageIndex + 1
    }
  }

  getPreviousPage() {
    if (this.pageIndex > 1) {
      this.pageIndex = this.pageIndex - 1
    }
  }
}
