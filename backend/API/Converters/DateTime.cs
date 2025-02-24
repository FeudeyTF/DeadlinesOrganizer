using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DeadlineOrganizerBackend.API.Converters
{
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
}
