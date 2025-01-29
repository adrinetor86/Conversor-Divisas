﻿
namespace WebConversor.Controllers;

    [Route("api/[controller]")]
    [ApiController]
    public class PdfController : ControllerBase
    {
        
        private readonly PdfService _pdfService;

        public PdfController(PdfService pdfService)
        {
            _pdfService = pdfService;
        }
        
        // Endpoint para generar un PDF con el historial de conversiones
        [HttpPost]
        public IActionResult GenerarListado([FromBody] List<HistoryRequest> history)
        {
            var pdfBytes = _pdfService.GenerarListadoPdf(history);
            return File(pdfBytes, "application/pdf", "Historial_Conversiones.pdf");
        }
        
}

