using HttpServer;
using HttpServer.Headers;
using System.Net;
using HttpListener = HttpServer.HttpListener;

namespace DeadlineOrganizerBackend.Rest
{
    internal class RestServer : IDisposable
    {
        private readonly Dictionary<int, IRestVersion> _versions;

        private readonly HttpListener _server;

        private readonly ContentTypeHeader _responseContentTypeHeader;

        private readonly List<IHeader> _responseHeaders;

        public RestServer(IPAddress ip, int port)
        {
            _versions = [];
            _server = HttpListener.Create(ip, port);
            _responseContentTypeHeader = new ContentTypeHeader("application/json; charset=utf-8");
            _responseHeaders = 
            [
                new StringHeader("Access-Control-Allow-Origin", "*"),
                new StringHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"),
                new StringHeader("Access-Control-Allow-Headers", "Content-Type")
            ];
        }

        public void Start()
        {
            _server.RequestReceived += HandleRequestReceived;
            _server.Start(int.MaxValue);
        }

        public void Stop()
        {
            _server.RequestReceived -= HandleRequestReceived;
            _server.Stop();
        }

        public void AddVersion(IRestVersion version)
        {
            _versions.TryAdd(version.Version, version);
        }

        private void HandleRequestReceived(object? sender, RequestEventArgs args)
        {
            args.Response.ContentType = _responseContentTypeHeader;
            foreach(var header in _responseHeaders)
                args.Response.Add(header);
            args.Response.Reason = "";

            Console.WriteLine($"HTTP {args.Context.RemoteEndPoint} {args.Request.Method} {args.Context.Request.Uri.AbsolutePath}");
            var response = ProduceResponse(args.Request, new RestEventArgs(args));
            var sendResponse = args.SendResponse(response);
            Console.WriteLine($"HTTP {args.Context.RemoteEndPoint} Returned {response.Status} {sendResponse}");
        }

        private RestResponse ProduceResponse(IRequest request, RestEventArgs args)
        {
            if (request.Uri.Segments.Length > 1)
            {
                var versionSegment = request.Uri.Segments[1];
                if (versionSegment.StartsWith('v'))
                {
                    if (int.TryParse(versionSegment[1..].Replace("/", ""), out var version))
                    {
                        if (_versions.TryGetValue(version, out var restVersion))
                        {
                            if (request.Uri.Segments.Length > 2)
                            {
                                var fullRoute = string.Join("/", request.Uri.Segments[2..]);
                                if (Enum.TryParse<HttpMethodType>(request.Method, true, out var method))
                                {
                                    foreach (var command in restVersion.GetRestEndpoints())
                                    {
                                        if ((command.Route == fullRoute || command.Route + '/' == fullRoute) && command.Method == method)
                                            return command.Delegate(args);
                                    }

                                    return new RestErrorResponse
                                    (
                                        HttpStatusCode.NotFound,
                                        $"RestCommand was not found in RestApi v.{restVersion.Version}!"
                                    );
                                }
                                else
                                    return new RestErrorResponse
                                     (
                                        HttpStatusCode.HttpVersionNotSupported,
                                        $"HTTP Method {request.Method} not supported!"
                                     );
                            }
                            else
                                return new RestErrorResponse
                                 (
                                    HttpStatusCode.HttpVersionNotSupported,
                                    "RestApi only version not supported!"
                                 );
                        }
                        else
                            return new RestErrorResponse
                            (
                                HttpStatusCode.NotFound,
                                $"RestApi v.{version} not found!"
                            );
                    }
                    else
                        return new RestErrorResponse
                        (
                            HttpStatusCode.UnprocessableEntity, 
                            "RestApi Version must be a number!"
                        );
                }
                else
                    return new RestErrorResponse
                    (
                        HttpStatusCode.NotFound,
                        "RestApi Version parameter was not found!"
                    );
            }
            else
                return new RestErrorResponse
                (
                    HttpStatusCode.LengthRequired,
                    "Invalid length!"
                );
        }

        public void Dispose()
        {
            Stop();
            GC.SuppressFinalize(this);
        }
    }
}
