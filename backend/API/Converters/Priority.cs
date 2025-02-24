using System.Text.Json;
using System.Text.Json.Serialization;

namespace DeadlineOrganizerBackend.API.Converters
{
    public class PriorityConverter : JsonConverter<Priority>
    {
        public override Priority Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (Enum.TryParse<Priority>(value, true, out var result))
                return result;
            return Priority.Low;
        }

        public override void Write(Utf8JsonWriter writer, Priority value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString());
        }
    }
}
