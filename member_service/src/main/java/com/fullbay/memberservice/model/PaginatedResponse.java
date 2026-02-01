package com.fullbay.memberservice.model;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Generic paginated response wrapper.
 *
 * @param <T> The type of items in the response
 */
@Schema(description = "Paginated response containing items and pagination metadata")
public class PaginatedResponse<T> {

  @Schema(description = "List of items in the current page")
  private List<T> items;

  @Schema(description = "Current page number (0-indexed)", example = "0")
  private int page;

  @Schema(description = "Number of items per page", example = "20")
  private int pageSize;

  @Schema(description = "Total number of items across all pages", example = "100")
  private long totalItems;

  @Schema(description = "Total number of pages", example = "5")
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
