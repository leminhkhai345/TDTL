namespace ExchangeDocument.BusinessLayer.Enums;

/// <summary>
/// All possible order status codes used in the system (for filtering/query).
/// The enum names match the <c>systemStatus.statusCode</c> records so that
/// they can be converted to string and compared directly.
/// </summary>
public enum OrderStatusCode
{
    PendingSellerConfirmation,
    ConfirmedBySeller,
    AwaitingOfflinePayment,
    PaymentConfirmed,
    PendingShipment,
    Shipped,
    Delivered,
    Completed,
    CancelledByBuyer,
    CancelledBySeller,
    RejectedBySeller
}

/// <summary>
/// Fields that client can use to sort query result.
/// </summary>
public enum OrderSortBy
{
    OrderDate,
    TotalAmount
}

/// <summary>
/// Sorting direction.
/// </summary>
public enum SortDirection
{
    Asc,
    Desc
}
