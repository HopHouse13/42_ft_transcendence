// Pour les CSS
declare module "*.css" {
	const content: { [className: string]: string };
	export default content;
}

// // Pour les images
// declare module "*.png" {
// 	const value: string;
// 	export default value;
// }

// // Pour les SVG
// declare module "*.svg" {
//   const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
//   export default ReactComponent;
// }

// // Pour les JSON
// declare module "*.json" {
//   const value: any;
//   export default value;
// }
