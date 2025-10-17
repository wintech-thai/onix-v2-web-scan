using Serilog;
using Microsoft.Extensions.FileProviders;
using OnixWebScan.AuditLogs;
using StackExchange.Redis;
using OnixWebScan.Utils;

var log = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();
Log.Logger = log;

var builder = WebApplication.CreateBuilder(args);

//Redis
var redisHost = Environment.GetEnvironmentVariable("REDIS_HOST");
var redisPort = Environment.GetEnvironmentVariable("REDIS_PORT");
var redisHostStr = $"{redisHost}:{redisPort}";

builder.Services.AddSingleton<IConnectionMultiplexer>(
sp => ConnectionMultiplexer.Connect(redisHostStr));
builder.Services.AddScoped<RedisHelper>();

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.WebRootPath, "scan-static")
    ),
    RequestPath = "/scan-static"
});

app.UseHttpsRedirection();
app.MapHealthChecks("/health");
app.UseStaticFiles();
app.UseMiddleware<AuditLogMiddleware>();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
