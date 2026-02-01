package com.fullbay.orgservice.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Generic paginated response wrapper.
 *
 * @param <T> The type of items in the response
 */
@Schema(description = "Paginated response containing items and pagination metadata")
public class PaginatedResponse<T> {

  @JsonProperty("items")
  @Schema(description = "List of items in the current page")
  private List<T> items;

  @JsonProperty("page")
  @Schema(description = "Current page number (0-indexed)", example = "0")
  private int page;

  @JsonProperty("pageSize")
  @Schema(description = "Number of items per page", example = "20")
  private int pageSize;

  @JsonProperty("totalItems")
  @Schema(description = "Total number of items across all pages", example = "100")
  private long totalItems;

  @JsonProperty("totalPages")
  @Schema(description = "Total number of pages", example = "5")
  private int totalPages;

  public PaginatedResponse() {}

  public PaginatedResponse(List<T> items, int page, int pageSize, long totalItems) {
    this.items = items;
    this.page = page;
    this.pageSize = pageSize;
    this.totalItems = totalItems;
    this.totalPages = (int) Math.ceil((double) totalItems / pageSize);
  }

  /**
   * Gets the items in the current page.
   *
   * @return The list of items
   */
  public List<T> getItems() {
    return items;
  }

  /**
   * Sets the items in the current page.
   *
   * @param items The list of items
   */
  public void setItems(List<T> items) {
    this.items = items;
  }

  /**
   * Gets the current page number (0-indexed).
   *
   * @return The page number
   */
  public int getPage() {
    return page;
  }

  /**
   * Sets the current page number.
   *
   * @param page The page number
   */
  public void setPage(int page) {
    this.page = page;
  }

  /**
   * Gets the page size.
   *
   * @return The number of items per page
   */
  public int getPageSize() {
    return pageSize;
  }

  /**
   * Sets the page size.
   *
   * @param pageSize The number of items per page
   */
  public void setPageSize(int pageSize) {
    this.pageSize = pageSize;
  }

  /**
   * Gets the total number of items across all pages.
   *
   * @return The total item count
   */
  public long getTotalItems() {
    return totalItems;
  }

  /**
   * Sets the total number of items.
   *
   * @param totalItems The total item count
   */
  public void setTotalItems(long totalItems) {
    this.totalItems = totalItems;
  }

  /**
   * Gets the total number of pages.
   *
   * @return The total page count
   */
  public int getTotalPages() {
    return totalPages;
  }

  /**
   * Sets the total number of pages.
   *
   * @param totalPages The total page count
   */
  public void setTotalPages(int totalPages) {
    this.totalPages = totalPages;
  }
}
