namespace OnixWebScan.Models;

public sealed class VerifyViewModel
{
    public string RawJson { get; init; } = "";
    public VerifyPayload? Payload { get; init; }

    // Derived UI fields
    public string StatusCss { get; init; } = "vx-badge warn";
    public string StatusText { get; init; } = "INFO";
    public string TtlDisplay { get; init; } = "-";

    // Helpers for formatting in View
    public static string Fmt(DateTimeOffset? dt)
        => dt is null ? "-" : dt.Value.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss");
}

public sealed class VerifyPayload
{
    public string? Status { get; set; }
    public string? DescriptionThai { get; set; }
    public string? DescriptionEng  { get; set; }
    public ScanItem? ScanItem { get; set; }
    public string? RedirectUrl { get; set; }
    public string? GetProductUrl { get; set; }
    public DateTimeOffset? DataGeneratedDate { get; set; }
    public int? TtlMinute { get; set; }
}

public sealed class ScanItem
{
    public string? Id { get; set; }
    public string? OrgId { get; set; }
    public string? Serial { get; set; }
    public string? Pin { get; set; }
    public string? Tags { get; set; }
    public string? ProductCode { get; set; }
    public string? SequenceNo { get; set; }
    public string? Url { get; set; }
    public string? RunId { get; set; }
    public string? UploadedPath { get; set; }
    public string? ItemGroup { get; set; }
    public string? RegisteredFlag { get; set; }
    public string? UsedFlag { get; set; }
    public DateTimeOffset? CreatedDate { get; set; }
    public DateTimeOffset? RegisteredDate { get; set; }
}