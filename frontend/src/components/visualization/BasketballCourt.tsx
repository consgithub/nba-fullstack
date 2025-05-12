import React, { useRef, useEffect } from 'react';
import { Coordinate } from '../../features/shots/shotSlice';
import '../../styles/BasketballCourt.css';

interface BasketballCourtProps {
  coordinates: Coordinate[];
  year: number;
  width?: number;
  height?: number;
}

const BasketballCourt: React.FC<BasketballCourtProps> = ({ 
  coordinates, 
  year,
  width = 640, 
  height = 600
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Colors for different shot zones
  const zoneColors: { [key: string]: string } = {
    'Restricted Area': '#FF5733',
    'Paint': '#FFC300',
    'Mid-Range': '#36A2EB',
    'Corner 3': '#4BC0C0',
    'Above Break 3': '#9966FF',
    'Backcourt': '#C9CBCF'
  };
  
  // Convert court coordinates to canvas coordinates
  const courtToCanvas = (x: number, y: number): [number, number] => {
    // NBA court is 94ft x 50ft
    // The coordinate system origin (0,0) is at the basket
    const courtWidth = 94;
    const courtHeight = 50;
    
    // Scale the coordinates to fit the canvas
    // We're using half court, so only 47ft of length
    const scaleX = width / 50;
    const scaleY = height / 47;
    
    // Flip the y coordinate so that the basket is at the bottom
    const canvasX = (x + 25) * scaleX;
    const canvasY = height - (y + 4) * scaleY;
    
    return [canvasX, canvasY];
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw court
    drawCourt(ctx);
    
    // Draw shot locations
    drawShots(ctx, coordinates);
    
  }, [coordinates, width, height]);
  
  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // Court boundary
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.stroke();
    
    // Draw basket
    const [baseCenterX, baseCenterY] = courtToCanvas(0, 0);
    ctx.beginPath();
    ctx.arc(baseCenterX, baseCenterY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    
    // Draw backboard
    const backboardWidth = 6 * width / 50;
    ctx.beginPath();
    ctx.moveTo(baseCenterX - backboardWidth/2, baseCenterY - 20);
    ctx.lineTo(baseCenterX + backboardWidth/2, baseCenterY - 20);
    ctx.stroke();
    
    // Draw restricted area
    ctx.beginPath();
    ctx.arc(baseCenterX, baseCenterY, 4 * width / 50, 0, Math.PI);
    ctx.stroke();
    
    // Draw paint
    const paintWidth = 16 * width / 50;
    const paintHeight = 19 * height / 47;
    ctx.beginPath();
    ctx.rect(baseCenterX - paintWidth/2, baseCenterY, paintWidth, paintHeight);
    ctx.stroke();
    
    // Draw free throw circle
    ctx.beginPath();
    ctx.arc(baseCenterX, baseCenterY + paintHeight, paintWidth/2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw three-point line
    ctx.beginPath();
    
    // Corner three (straight lines)
    const cornerThreeY = height - (14 * height / 47);
    
    // Left corner three
    ctx.moveTo(0, cornerThreeY);
    const [leftCornerX, leftCornerY] = courtToCanvas(-22, 14);
    ctx.lineTo(leftCornerX, leftCornerY);
    
    // Right corner three
    ctx.moveTo(width, cornerThreeY);
    const [rightCornerX, rightCornerY] = courtToCanvas(22, 14);
    ctx.lineTo(rightCornerX, rightCornerY);
    
    // Arc from left corner to right corner
    ctx.arc(baseCenterX, baseCenterY, 23.75 * width / 50, Math.PI, 0);
    
    ctx.stroke();
    
    // Half court line
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(width, 5);
    ctx.stroke();
    
    // Text label for the year
    ctx.font = '20px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(`NBA Shot Distribution - ${year}`, width / 2, 30);
  };
  
  const drawShots = (ctx: CanvasRenderingContext2D, coordinates: Coordinate[]) => {
    // Scale the radius based on shot frequency
    const maxCount = Math.max(...coordinates.map(coord => coord.count));
    
    for (const coord of coordinates) {
      const [x, y] = courtToCanvas(coord.x, coord.y);
      
      // Calculate radius based on shot frequency
      const minRadius = 2;
      const maxRadius = 15;
      const radius = minRadius + (maxRadius - minRadius) * (coord.count / maxCount);
      
      // Draw circle for shot location
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      
      // Get color based on zone
      const color = zoneColors[coord.zone] || '#999';
      
      // Fill with semi-transparent color
      ctx.fillStyle = `${color}80`; // Add 50% transparency
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };
  
  return (
    <div className="basketball-court-container">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="basketball-court"
      />
    </div>
  );
};

export default BasketballCourt;