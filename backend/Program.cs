using HttpServer;
using HttpServer.Headers;
using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using HttpListener = HttpServer.HttpListener;

namespace DeadlineOrganizerBackend
{
    internal class Program
    {
        public static readonly IPAddress IP;

        public const int Port = 3001;

        private static readonly HttpListener _server;

        private static readonly List<Deadline> _deadlines;

        private static readonly JsonSerializerOptions _options = new()
        {
            Converters = { new DateTimeConverter(), new PriorityConverter() },
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        static Program()
        {
            IP = IPAddress.Loopback;
            _server = HttpListener.Create(IP, Port);
            _deadlines = [];
        }

        static int id = 1;

        static void Main(string[] args)
        {
            _deadlines.Add(new(1, "test", "test123", 1, Priority.High, DateTime.Now.AddDays(-10), DateTime.Now.AddDays(10), []));
            _server.Start(int.MaxValue);
            Console.WriteLine($"Http Server started at {IP}:{Port}");
            _server.RequestReceived += HandleRequestRecieved;
            while (true)
            {
                var command = Console.ReadLine();
                if (!string.IsNullOrEmpty(command) && command.Equals("exit", StringComparison.OrdinalIgnoreCase))
                    return;
            }
        }

        private static void HandleRequestRecieved(object? sender, RequestEventArgs args)
        {
            args.Response.ContentType = new ContentTypeHeader("application/json; charset=utf-8");
            args.Response.Add(new StringHeader("Access-Control-Allow-Origin", "*"));
            args.Response.Add(new StringHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"));
            args.Response.Add(new StringHeader("Access-Control-Allow-Headers", "Content-Type"));

            Console.WriteLine($"GOT REQUEST {args.Context.Request.Uri} FROM " + args.Context.RemoteEndPoint);
            var obj = GetRestObject(args);
            var str = JsonSerializer.Serialize(obj.Object, _options);
            Console.WriteLine("SENDING " + str + " WITH STATUS " + obj.Status);
            var bytes = Encoding.UTF8.GetBytes(str);
            args.Response.Body.Write(bytes, 0, bytes.Length);
            args.Response.Status = obj.Status;
        }

        private static RestObject GetRestObject(RequestEventArgs args)
        {
            if (args.Request.Uri.Segments.Length > 0)
            {
                switch (args.Request.Uri.Segments.Last())
                {
                    case "deadlines":
                        if (args.Request.Method == "POST")
                        {
                            var body = new byte[args.Request.Body.Length];
                            args.Request.Body.ReadExactly(body);
                            var str = Encoding.UTF8.GetString(body);
                            var deadline = JsonSerializer.Deserialize<Deadline>(str, _options);
                            if (deadline != null)
                            {
                                deadline.Id = ++id;
                                _deadlines.Add(deadline);
                                return new RestObject(HttpStatusCode.Created, deadline);
                            }
                            return new RestObject(HttpStatusCode.BadRequest, null);
                        }
                        return new RestObject(HttpStatusCode.OK, _deadlines);
                    case "tags":
                        return new RestObject(HttpStatusCode.OK, new List<object>());
                }
            }
            return new(HttpStatusCode.NoContent, null);
        }
    }

    public class DateTimeConverter : JsonConverter<DateTime>
    {
        private const string DateFormat = "yyyy-MM-dd'T'HH:mm";

        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var dateTimeString = reader.GetString();
            if (dateTimeString == null)
                return DateTime.MinValue;
            return DateTime.ParseExact(dateTimeString, DateFormat, CultureInfo.InvariantCulture);
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString(DateFormat, CultureInfo.InvariantCulture));
        }
    }
    public class PriorityConverter : JsonConverter<Priority>
    {
        public override Priority Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if(Enum.TryParse<Priority>(value, true, out var result))
                return result;
            return Priority.Low;
        }

        public override void Write(Utf8JsonWriter writer, Priority value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString());
        }
    }

    public class RestObject
    {
        public HttpStatusCode Status;

        public object? Object;

        public RestObject(HttpStatusCode status, object? obj)
        {
            Status = status;
            Object = obj;
        }
    }

    public enum Priority
    {
        High,
        Medium,
        Low
    }

    public class Deadline
    {
        public int Id { get; set; }

        public string CourseName { get; set; }

        public string TaskName { get; set; }

        public int TimeToDo { get; set; }

        public Priority Priority { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime EndDate { get; set; }

        public List<object> Tags { get; set; }

        public Deadline(int id, string courseName, string taskName, int timeToDo, Priority priority, DateTime createdDate, DateTime endDate, List<object> tags)
        {
            Id = id;
            CourseName = courseName;
            TaskName = taskName;
            TimeToDo = timeToDo;
            Priority = priority;
            CreatedDate = createdDate;
            EndDate = endDate;
            Tags = tags;
        }
    }
}
