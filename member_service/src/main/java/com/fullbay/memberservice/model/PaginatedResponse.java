package com.fullbay.memberservice.model;

import java.util.List;

/**
 * Generic paginated response wrapper.
 *
 * @param <T> The type of items in the response
 */
public class PaginatedResponse<T> {

  private List<T> items;
  private int page;
  private int pageSize;
  private long totalItems;
  private int totalPages;

  /** Default constructor for JSON deserialization. */
  public PaginatedResponse() {}

  /**
   * Creates a new PaginatedResponse.
   *
   * @param items The list of items for this page
   * @param page The current page number (0-indexed)
   * @param pageSize The number of items per page
   * @param totalItems The total number of items across all pages
   */
  public PaginatedResponse(List<T> items, int page, int pageSize, long totalItems) {
    this.items = items;
    this.page = page;
    this.pageSize = pageSize;
    this.totalItems = totalItems;
    this.totalPages = (int) Math.ceil((double) totalItems / pageSize);
  }

  public List<T> getItems() {
    return items;
  }

  public void setItems(List<T> items) {
    this.items = items;
  }

  public int getPage() {
    return page;
  }

  public void setPage(int page) {
    this.page = page;
  }

  public int getPageSize() {
    return pageSize;
  }

  public void setPageSize(int pageSize) {
    this.pageSize = pageSize;
  }

  public long getTotalItems() {
    return totalItems;
  }

  public void setTotalItems(long totalItems) {
    this.totalItems = totalItems;
  }

  public int getTotalPages() {
    return totalPages;
  }

  public void setTotalPages(int totalPages) {
    this.totalPages = totalPages;
  }
}
