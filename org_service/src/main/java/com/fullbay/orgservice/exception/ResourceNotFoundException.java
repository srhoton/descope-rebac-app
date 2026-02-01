package com.fullbay.orgservice.exception;

/** Exception thrown when a requested resource is not found. */
public class ResourceNotFoundException extends RuntimeException {

  private final String resourceType;
  private final String resourceId;

  /**
   * Creates a new ResourceNotFoundException.
   *
   * @param resourceType The type of resource (e.g., "Tenant")
   * @param resourceId The identifier of the resource
   */
  public ResourceNotFoundException(String resourceType, String resourceId) {
    super(String.format("%s not found: %s", resourceType, resourceId));
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  /**
   * Gets the resource type.
   *
   * @return The resource type
   */
  public String getResourceType() {
    return resourceType;
  }

  /**
   * Gets the resource identifier.
   *
   * @return The resource identifier
   */
  public String getResourceId() {
    return resourceId;
  }
}
