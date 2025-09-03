using API.Controllers;
using API.DTOs;
using API.Extensions;
using API.RequestHelpers;
using API.Services;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace RAGChatbotApi.Controllers
{    
    public class ChatController(IUnitOfWork unit, VectorStoreService _vectorStore,
        GeminiService _geminiService, ChatMemoryService _chatMemory) : BaseApiController
    {
        //private readonly VectorStoreService _vectorStore;
        //private readonly GeminiService _geminiService;
        //private readonly ChatMemoryService _chatMemory;

        //public ChatController(Services.VectorStoreService vectorStore, Services.GeminiService geminiService, Services.ChatMemoryService chatMemory)
        //{
        //    _vectorStore = vectorStore;
        //    _geminiService = geminiService;
        //    _chatMemory = chatMemory;
        //}

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] Models.QuestionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Question))
                return BadRequest("The question field is required.");

            var normalized = dto.Question.ToLower().Trim();

            // ✅ Handle "How many products" manually without LLM
            if (normalized.Contains("how many products") || normalized.Contains("كم عدد المنتجات") || normalized.Contains("عدد المنتجات"))
            {
                var count = _vectorStore.GetProductCount();
                return Ok(new { answer = $"There are {count} products in the store." });
            }

            // ✅ Use memory + context
            //var sessionId = HttpContext.Connection.Id;
            var sessionId = Request.Headers["X-Session-Id"].FirstOrDefault() ?? HttpContext.Connection.Id;

            var context = await _vectorStore.SearchAsync(dto.Question);
            var history = _chatMemory.GetConversationHistory(sessionId);
            var fullPrompt = $"Conversation so far:\n{history}\n\nUser: {dto.Question}\nAnswer:";

            var answer = await _geminiService.GenerateAnswerAsync(fullPrompt, context);
            _chatMemory.AddToMemory(sessionId, dto.Question, answer);

            return Ok(new { answer });
        }

        [HttpGet("memory")]
        public IActionResult GetMemory([FromHeader(Name = "X-Session-Id")] string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
                return BadRequest("Missing X-Session-Id header.");

            var history = _chatMemory.GetConversationHistory(sessionId);
            return Ok(new { sessionId, history });
        }
    }
}

