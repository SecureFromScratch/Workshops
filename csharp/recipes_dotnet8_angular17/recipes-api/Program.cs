using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Extensions.Configuration;

using recipes_api;
using recipes_api.Controllers;
using recipes_api.data;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to listen on multiple specific IP addresses and ports
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Listen(System.Net.IPAddress.Parse("127.0.0.1"), 5187); // First IP
    string? myDeviceIP = builder.Configuration["MyDeviceIP"];
    if (myDeviceIP != null)
    {
        serverOptions.Listen(System.Net.IPAddress.Parse(myDeviceIP), 5187); // Second IP
    }
    else
    {
        serverOptions.Listen(System.Net.IPAddress.Parse("192.168.1.187"), 5187); // random IP just to cause an error loading up

    }
    // Add more IPs as needed
});


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", builder =>
    {
        builder.WithOrigins("http://localhost:4200") // Allow Angular development server
               .AllowAnyMethod()  // Allow all HTTP methods (GET, POST, etc.)
               .AllowAnyHeader()  // Allow all headers               
               .AllowCredentials(); // Allow cookies or other credentials
    });
});



builder.Services.AddMvc();
// Add services for anti-forgery



var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddSingleton<IRecipeDataLayer>(new RecipeDataLayer(connectionString));


var app = builder.Build();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.UseStaticFiles(); 
app.UseRouting();

app.UseCors("AllowAngularApp");
app.MapControllers();

var users = new List<(string Username, string Password)>
{
    ("user1", Guid.NewGuid().ToString("N").Substring(0, 8)),
    ("user2", Guid.NewGuid().ToString("N").Substring(0, 8))
};

foreach (var user in users) {
    Console.WriteLine($"Generated user: {user.Username}, Password: {user.Password}");
    UserStore.Users[user.Username] = user.Password;

}
app.Run();
